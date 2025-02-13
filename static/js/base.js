// 滚动到底部的函数
function scrollToBottom() {
    const chatbox = document.getElementById('chatbox');
    chatbox.scrollTo({
        top: chatbox.scrollHeight,
        behavior: 'smooth' // 平滑滚动
    });
}

// 生成 UUID 的函数
function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    } else {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// 创建消息元素的函数
function createMessageElement(senderType, senderName, content, iconUrl,chatId) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${senderType}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';

    const imgElement = document.createElement('img');
    imgElement.src = iconUrl;
    imgElement.alt = `${senderName} Icon`;

    const strongElement = document.createElement('strong');
    strongElement.textContent = senderName;

    headerDiv.appendChild(imgElement);
    headerDiv.appendChild(strongElement);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (chatId) {
        contentDiv.id = `${chatId}`;
    }
    contentDiv.textContent = content;

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

// 添加消息到聊天框
function addMessageToChatbox(senderType, senderName, content, iconUrl,chatId) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = createMessageElement(senderType, senderName, content, iconUrl,chatId);
    chatbox.appendChild(messageElement);
    scrollToBottom();
}
