import { defineStore } from 'pinia';
import deepseekRepository from '../repositories/deepseekRepository';

export const useAIStore = defineStore('ai', {
  state: () => ({
    aiResponse: '',
    isLoading: false,
    error: null,
    lastRequestTime: null,
    chatHistory: [] // 新增聊天历史记录
  }),
  actions: {
    async askAI(prompt) {
      this.isLoading = true;
      this.error = null;
      this.lastRequestTime = new Date();
      
      // 添加用户消息到历史记录
      this.addMessage('user', prompt);
      
      try {
        const startTime = Date.now();
        this.aiResponse = await deepseekRepository.chatWithDeepSeek(prompt);
        console.log(`请求耗时: ${Date.now() - startTime}ms`);
        
        // 添加AI回复到历史记录
        this.addMessage('assistant', this.aiResponse);
      } catch (error) {
        console.error('AI请求错误:', error);
        this.error = error.message;
        this.addMessage('assistant', this.error, true);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 新增方法：添加消息到历史记录
    addMessage(role, content, isError = false) {
      this.chatHistory.push({
        id: Date.now(),
        role,
        content,
        isError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      // 限制历史记录条数，防止内存占用过大
      if (this.chatHistory.length > 50) {
        this.chatHistory.shift();
      }
    },
    
    // 新增方法：清空历史记录
    clearHistory() {
      this.chatHistory = [];
    }
  }
});