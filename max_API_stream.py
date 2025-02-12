import os
from flask import Flask, request, jsonify, render_template,Response,stream_with_context
from openai import OpenAI


app = Flask(__name__)

client = OpenAI(
    # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
    api_key='your_api_key',
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)


@app.route('/', methods=['GET'])
def index():
    return render_template('stream/index_stream.html')  # 修改：返回index_stream.html页面
messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
        ]


@app.route('/chat', methods=['POST','GET'])
def chat():
    if request.method == 'POST':
        # 处理 POST 请求
        data = request.json
        user_message = data.get('message', '')
    else:
        # 处理 GET 请求
        user_message = request.args.get('message', '')
    messages.append({'role': 'user', 'content': user_message})
    # 调用大模型生成流式响应
    completion = client.chat.completions.create(
        model="qwen-max-latest",  # 模型名称
        messages=messages,
        stream=True,  # 开启流式传输
        stream_options={"include_usage": True}
    )
    # 流式输出数据
    def generate():
        print(messages)

        assistant_output = ""
        yield "data: [START]\n\n"
        for chunk in completion:
            if hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content
                if content:
                    assistant_output += content
                    yield f"data: {content}\n\n"  # SSE 格式：每条消息以 "data:" 开头，以两个换行符结尾
        yield "data: [DONE]\n\n"  # 结束标志
        messages.append({'role': 'assistant', 'content': assistant_output})

    return Response(stream_with_context(generate()), content_type='text/event-stream')
if __name__ == '__main__':
    app.run(debug=True)