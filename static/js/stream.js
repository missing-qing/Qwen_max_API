// 绑定发送按钮事件
document.getElementById('sendButton').addEventListener('click', function () {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    // 显示用户消息
    const userIconUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTagAUI2PiSNsfW-nF3bM8SmhNtuKw3WWOAQQ&s';
    addMessageToChatbox('user', '用户', userInput, userIconUrl);

    // 清空输入框
    document.getElementById('userInput').value = '';

    // 创建 EventSource 连接
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