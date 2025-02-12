// 绑定发送按钮事件
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