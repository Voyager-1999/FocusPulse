<template>
  <div class="ai-assistant-view">
    <div class="ai-header">
      <h2>AI 助手</h2>
      <p class="subtitle">智能对话助手</p>
    </div>
    
    <div class="ai-chat-container">
      <div class="message-container">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{
            'user-message': message.role === 'user',
            'ai-message': message.role === 'assistant',
            'error-message': message.isError,
            'welcome-message': message.isWelcome
          }"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time" v-if="!message.isWelcome">
            {{ message.timestamp }}
          </div>
        </div>
        
        <div v-if="aiStore.isLoading" class="loading-indicator">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>AI正在思考中...</span>
        </div>
      </div>
      
      <div class="input-area">
        <el-input
          v-model="currentPrompt"
          placeholder="输入你的问题... (Shift+Enter换行，Enter发送)"
          type="textarea"
          :rows="3"
          resize="none"
          :disabled="aiStore.isLoading"
          @keyup.enter="handleKeydown"
        />
        <el-button 
          type="primary" 
          @click="handleSend"
          :loading="aiStore.isLoading"
          class="send-btn"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useAIStore } from '../store/ai.store';
import { Loading } from '@element-plus/icons-vue';

// 示例问题
const sampleQuestions = [
  "如何提高工作效率？",
  "番茄工作法是什么？",
  "如何管理每日任务？"
];

const aiStore = useAIStore();
const currentPrompt = ref('');
const messages = ref([]);

// 从store加载历史记录并添加欢迎消息
onMounted(() => {
  messages.value = [...aiStore.chatHistory];
  
  // 如果没有任何历史记录，添加欢迎消息和示例问题
  if (messages.value.length === 0) {
    aiStore.addMessage(
      'assistant', 
      `你好！我是你的AI助手，请问有什么可以帮您？\n\n你可以尝试询问：\n${sampleQuestions.map(q => `• ${q}`).join('\n')}`,
      false,
      true
    );
  }
  
  scrollToBottom();
});

const handleKeydown = (event) => {
  if (event.shiftKey) {
    // Shift+Enter 允许换行
    return;
  }
  // 单独Enter 发送消息
  event.preventDefault();
  handleSend();
};

const handleSend = () => {
  const prompt = currentPrompt.value.trim();
  if (!prompt || aiStore.isLoading) return;
  
  sendPrompt(prompt);
};

const sendPrompt = async (prompt) => {
  currentPrompt.value = '';
  await aiStore.askAI(prompt);
  scrollToBottom();
};

const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.querySelector('.message-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 50);
};

watchEffect(() => {
  messages.value = [...aiStore.chatHistory];
});
</script>

<style scoped>
.ai-assistant-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-header {
  margin-bottom: 20px;
}

.ai-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  margin: 5px 0 0;
  color: #909399;
  font-size: 14px;
}

.ai-chat-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  height: calc(100vh - 180px);
}

.message-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 85%;
  position: relative;
  word-break: break-word;
}

.user-message {
  background: #e1f5fe;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

.ai-message {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-bottom-left-radius: 0;
}

.error-message {
  background: #ffebee;
  color: #f44336;
}

.welcome-message {
  background: #f5f5f5;
  color: #666;
  max-width: 100%;
  text-align: center;
  margin-bottom: 20px;
}

.message-content {
  white-space: pre-line;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: #666;
}

.loading-icon {
  margin-right: 8px;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.input-area {
  display: flex;
  gap: 10px;
}

.send-btn {
  width: 100px;
}

/* 滚动条样式 */
.message-container::-webkit-scrollbar {
  width: 6px;
}

.message-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>