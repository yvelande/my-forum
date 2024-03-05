<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 slot="header" class="register-title">用户注册</h2>
      <el-form ref="registerForm" :model="registerForm" :rules="registerRules" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="registerForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input v-model="registerForm.pwd" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="register">注册</el-button>
          <el-button @click="connectWallet">连接钱包</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      registerForm: {
        userName: '',
        pwd: ''
      },
      registerRules: {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        pwd: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      userAddress: '' // 声明 userAddress 并设置初始值为空字符串
    };
  },
  methods: {
    register() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          // 获取用户名和密码
          const { userName, pwd } = this.registerForm;
          // 获取连接钱包的地址
          const userAddress = this.userAddress; // 修改为 userAddress
          
          // 发送注册请求到后端
          axios.post('/register', {
            userName: userName,
            pwd: pwd,
            userAddress: userAddress
          })
          .then(response => {
            // 处理注册成功的逻辑
            console.log(response.data);
          })
          .catch(error => {
            // 处理注册失败的逻辑
            console.error(error);
            console.log(error.message)
          });
        } else {
          return false;
        }
      });
    },
    connectWallet() {
      if (typeof window.ethereum !== 'undefined') {
        // 请求用户授权连接到以太坊账号
        window.ethereum.request({ method: 'eth_requestAccounts' })
          .then(accounts => {
            const account = accounts[0];
            // 弹窗显示已连接到的账号地址
            this.$message.success(`已连接到账号: ${account}`);
            this.userAddress = account; // 更新 userAddress
            console.log('已连接到账号:', account);
            // 这里可以执行与连接成功相关的逻辑，例如更新页面内容或发送交易
          })
          .catch(error => {
            console.error('连接钱包失败:', error);
            // 弹窗显示连接失败的提示
            this.$message.error('连接钱包失败');
          });
      } else {
        console.error('请安装以太坊浏览器插件（如Metamask）');
        // 弹窗显示没有安装插件的提示
        this.$message.error('请安装以太坊浏览器插件（如Metamask）');
      }
    }
  }
};
</script>