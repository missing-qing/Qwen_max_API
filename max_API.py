import os
from flask import Flask, request, jsonify, render_template
from openai import OpenAI


app = Flask(__name__)

client = OpenAI(
    # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
    api_key='your api key',
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)


@app.route('/', methods=['GET'])
def index():
    return render_template('index/index.html')  # 修改：返回index.html页面


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')

    completion = client.chat.completions.create(
        model="qwen-max-latest",
        messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': user_message}],

    )

    # 提取并打印大模型的回答内容
    response_content = completion.choices[0].message.content

    return jsonify({'response': response_content})

if __name__ == '__main__':
    app.run(debug=True)