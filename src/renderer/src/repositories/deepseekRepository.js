import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'sk-80cae30594cd4d9c9ef71e7e4bf7c943'; 

// 网络测试函数
async function testNetworkConnection() {
  try {
    console.log('开始网络连通性测试...');
    const testResponse = await axios.get('https://httpbin.org/get', {
      timeout: 5000
    });
    console.log('网络测试成功:', {
      status: testResponse.status,
      data: testResponse.data
    });
    return true;
  } catch (error) {
    console.error('网络测试失败:', {
      message: error.message,
      code: error.code,
      config: error.config
    });
    return false;
  }
}

export default {
  async chatWithDeepSeek(prompt, model = 'deepseek-chat') {
    // 先执行网络测试
    const isNetworkOK = await testNetworkConnection();
    if (!isNetworkOK) {
      throw new Error('网络基础连接失败，请检查Electron网络权限');
    }

    console.log('发送请求到DeepSeek API，内容:', prompt);
    
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('收到API响应:', response.data);
      
      if (!response.data.choices || !response.data.choices[0]?.message?.content) {
        throw new Error('无效的API响应格式');
      }
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API调用错误:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      throw new Error(`AI请求失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }
};