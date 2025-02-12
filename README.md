# Qwen2.5-Max API 调用示例

## 安装依赖包
```bash
pip install openai
pip install flask
```
## 配置API 调用实例

```python
import os
from openai import OpenAI

client = OpenAI(
    # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"), 
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
completion = client.chat.completions.create(
    model="", 
    messages=[
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': '你是谁？'}],
    )
    
print(completion.model_dump_json())
```
### 配置说明
1.在[阿里云百炼平台](https://help.aliyun.com/zh/model-studio/)获取API Key
2.在[阿里云百炼平台](https://help.aliyun.com/zh/model-studio/getting-started/models)获取模型名称
3.修改配置：
```python
API_KEY = "sk-xxx" # 替换为你的API密钥 
MODEL_NAME = "qwen-max-latest" #选择的模型名称
```





### 运行程序
```json
{"id":"chatcmpl-7889bab6-9ae0-9d87-9fbf-fa151fa2db14","choices":[{"finish_reason":"stop","index":0,"logprobs":null,"message":{"content":"我是来自阿里云的大规模语言模型，我叫通义千问。","refusal":null,"role":"assistant","audio":null,"function_call":null,"tool_calls":null}}],"created":1739363139,"model":"qwen-plus","object":"chat.completion","service_tier":null,"system_fingerprint":null,"usage":{"completion_tokens":16,"prompt_tokens":22,"total_tokens":38,"completion_tokens_details":null,"prompt_tokens_details":{"audio_tokens":null,"cached_tokens":0}}}

```



## 前后端交互
### 后端
后端采用Flask框架，前端采用原生html。
```python

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
```



### 前端
```js
document.getElementById('sendButton').addEventListener('click', function () {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    // 显示用户消息
    const userIconUrl = 'https://img2.baidu.com/it/u=3921464713,1750126262&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500';
    addMessageToChatbox('user', '用户', userInput, userIconUrl);

    // 清空输入框
    document.getElementById('userInput').value = '';

    // 模拟发送消息并接收回复
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const botIconUrl = 'https://chat.qwenlm.ai/static/favicon.png';
        addMessageToChatbox('bot', 'Qwen2.5-Max', data.response, botIconUrl);
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = '无法连接到服务器，请稍后重试。';
        addMessageToChatbox('error', '系统', errorMessage, '');
    });
});
```
前端通过JavaScript的fetch API来发送请求并接收后端返回的信息。

1. **获取用户输入**：从输入框中获取用户的消息。
2. **显示用户消息**：将用户的消息显示在聊天框中。
3. **清空输入框**：清空输入框以便用户输入新的消息。
4. **发送请求**：使用fetch API向后端的/chat接口发送POST请求，并将用户的消息作为请求体发送。
5. **处理响应**：接收到后端的响应后，提取回复内容并将其显示在聊天框中。

## 流式输出
流式输出是指模型在生成回复时，会实时返回生成的内容，而不是一次性返回整个回复。

### 流式输出后端实现
在Qwen2.5-Max模型中，流式输出是通过设置stream参数为True来实现的。在调用client.chat.completions.create()方法时，将stream参数设置为True，即可开启流式输出。
```python
completion = client.chat.completions.create(
        model="qwen-max-latest",  # 模型名称
        messages=messages,
        stream=True,  # 开启流式传输
        stream_options={"include_usage": True}
    )
```
后端可以通过监听completion.aiter()的生成器，来实时获取模型的回复。
```python
    def generate():
        assistant_output = ""
        yield "data: [START]\n\n"
        for chunk in completion:
            if hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content
                if content:
                    assistant_output += content
                    yield f"data: {content}\n\n"  # SSE 格式：每条消息以 "data:" 开头，以两个换行符结尾
        yield "data: [DONE]\n\n"  # 结束标志

    return Response(stream_with_context(generate()), content_type='text/event-stream')
```
1. **开启流式传输**：在调用client.chat.completions.create()方法时，将stream参数设置为True，即可开启流式输出。
2. **实时获取回复**：通过监听completion.aiter()的生成器，来实时获取模型的回复。
3. **开始结束标志**：在回复开始时发送一个"[START]"表示开始标志，在回复结束时，发送一个 "[DONE]" 字符串作为结束标志。


## 流式输出前端实现
前端可以通过Server-Sent Events (SSE) 从后端获取模型的回复。
```js
const eventSource = new EventSource(`/chat?message=${encodeURIComponent(userInput)}`);
    let chatId = null;

    eventSource.onmessage = function (event) {
        const data = event.data;

        if (data === '[START]') {
            chatId = generateUUID();
            const botIconUrl = 'https://chat.qwenlm.ai/static/favicon.png';
            addMessageToChatbox('bot', 'Qwen2.5-Max', '', botIconUrl);
        } else if (data === '[DONE]') {
            eventSource.close();
            scrollToBottom();
        } else {
            if (chatId) {
                const element = document.getElementById(chatId);
                if (element) {
                    element.textContent += data;
                    scrollToBottom();
                }
            }
        }
    };

    eventSource.onerror = function (error) {
        console.error('Error occurred with SSE connection:', error);
        eventSource.close();
        addMessageToChatbox('error', '系统', '无法连接到服务器', '');
    };
});
```

1. **生成唯一ID**：在每次发送请求时，生成一个唯一的ID，用于标识当前回复的聊天记录。
2. **监听后端的流式输出**：使用EventSource对象来监听后端的流式输出。
3. **处理后端的回复**：在每次收到后端的回复时，将其添加到聊天框中。
4. **滚动到底部**：每次收到回复时，滚动到底部，以显示最新的回复。

## 多轮对话
多轮对话是指用户与模型进行多次对话的过程。在Qwen2.5-Max模型中，多轮对话可以通过设置messages参数来实现。在调用client.chat.completions.create()方法时，将messages参数设置为用户与模型之前的对话记录。
```python
messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
        ]

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
```
1. **设置messages参数**：在调用client.chat.completions.create()方法时，将messages参数设置为用户与模型之前的对话记录。
2. **处理用户输入**：在每次收到用户输入时，将其添加到messages列表中，并调用client.chat.completions.create()方法生成流式回复。
3. **流式输出数据**：通过监听completion.aiter()的生成器，来实时获取模型的回复。
4. **保存对话记录**：每次收到回复时，将其添加到messages列表中，以便下一次对话时继续使用。



# **详细了解Qwen调用开发文档，请访问[阿里云百炼平台开发参考](https://help.aliyun.com/zh/model-studio/developer-reference/)**