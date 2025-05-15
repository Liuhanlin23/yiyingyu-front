import axios from 'axios'
const LoginUrl="http://localhost:8080/Login";
//登录请求dto
class LoginPasswordDto{
    constructor(phone,password)
    {
        this.phone=phone;
        this.password=password;
    }
}
class LoginSmsDto{
    constructor(phone,smsCode){
        this.phone=phone;
        this.smsCode=smsCode;
    }
}
const tabs = document.querySelectorAll('.login-tabs .tab-item');
const tabContents = document.querySelectorAll('.tab-content');
const btnGetSmsCode = document.getElementById('btnGetSmsCode');
let countdown = 60;
//手机号格式验证函数
function validatePhoneNumber(phone) {
    const phonePattern = /^1[3456789]\d{9}$/;
    // ^1  以1开头
    // [3456789] 第2位，使用原子表里的任意一个原子都可以
    // \d{9}$  第三位  朝后可以是任意数字  并且最后结尾必须是数字
    return phonePattern.test(phone);
}
/*密码格式验证
*return 0:密码符合规范 
*return 1:长度小于6位
*return 2:长度大于16
 return 3.不包含任何空格字符 (包括普通空格、tab等)
 */
function validatePassword(password) {
    const passwordPattern = /\s/;
    if (password.length < 6) {
        return 1;
    }
    if(password.length>16)
    {
        return 2;
    }
    if (passwordPattern.test(password)) {
        return 3;
    }
    return 0;
};
// 手机号格式错误提示信息
function showError(inputElement, message) {
    const inputGroup = inputElement.parentElement;
    const errorElement = inputGroup.querySelector(".error-message");
    if (!errorElement) {
        console.warn("找不到错误消息元素", inputElement.id);
        return;
    }
    inputGroup.classList.add("error");
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}
//清除手机号格式错误提示信息
function clearError(inputElement) {
    console.log("清除错误提示信息", inputElement.id);
    const inputGroup = inputElement.parentElement;;
    const errorElement = inputGroup.querySelector(".error-message");
    if (!errorElement) {
        console.warn("找不到错误消息元素", inputElement.id);
        return;
    }
    inputGroup.classList.remove("error");
    errorElement.textContent = "";
    errorElement.style.display = "none";
}

//密码登录表单验证
const passwordForm = document.getElementById("password-form");
if (passwordForm) {
    passwordForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let isValid = true;
        const userName = document.getElementById("username");
        const password = document.getElementById("password");
        //清除之前的错误提示
        clearError(userName);
        clearError(password);
        if (!userName.value.trim()) {
            showError(userName, "请填写手机号");
            isValid = false;
        }
        else if (!validatePhoneNumber(userName.value)) {
            console.log("手机号格式不正确");
            showError(userName, "手机号格式不正确");
            isValid = false;
        }
        //验证密码TODO:
        const passwordResult=validatePassword(password.value);
        if(passwordResult!=0)
        {
            isValid=false;
            switch(passwordResult)
            {
                case 1:{showError(password,"密码长度小于6位"); break;}
                case 2:{showError(password,"密码长度大于16位"); break;}
                case 3:{showError(password,"密码包含特殊字符"); break;}
            }
        }

        if (isValid) {
            //如果验证通过,可以提交表单
            let LoginButton=document.getElementById("Login-button");
            if(loginButton)
            {
                loginButton.disabled=true;
            }
            console.log('密码登录表单验证通过，准备提交');
            //实现"实现记住我功能"
            const rememberMe = document.getElementById("remember");
            if (rememberMe) {
                localStorage.setItem("username", userName.value);
            }
            //发送登录请求
            axios.post(LoginUrl,new LoginPasswordDto(userName.value,password.value)).then(response=>{

            }).catch(error=>{
                //请求失败
                console.error("登陆失败",error);
            })
            if(loginButton)
            {
                loginButton.disabled=false;
            }
        }
    })
}
//短信登录表单验证
const smsForm = document.getElementById("sms-form");
if (smsForm) {
    smsForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let isValid = true;
        const phone = document.getElementById("phone");
        const smsCode = document.getElementById("sms_code");
        //清除之前的错误提示
        clearError(phone);
        clearError(smsCode);
        if (!phone.value.trim()) {
            showError(phone, "请填写手机号");
            isValid = false;
        }
        else if (!validatePhoneNumber(phone.value)) {
            showError(phone, "手机号格式不正确");
            isValid = false;
        }
        //校验验证码格式
        if (!smsCode.value.trim()) {
            showError(smsCode, "请填写验证码");
            isValid = false;
        }
        else if (smsCode.value.trim().length != 6) {
            showError(smsCode, "验证码格式不正确")
            isValid = false;
        }
        if (isValid) {
            //如果验证通过,可以提交表单
        //   axios.post(LoginUrl,new LoginSmsDto(phone.value,))

        }
    })
}
//实时验证手机号
const phoneInputs = document.querySelectorAll("#username,#phone");

phoneInputs.forEach(input => {
    input.addEventListener("blur", function () {
        if (this.value.trim() != "" && !validatePhoneNumber(this.value)) {
            showError(this, "手机号格式不正确");
        }
        else {
            console.log("手机号格式正确");
            clearError(this);

        }
    });
});
//切换 密码登录或短信登录
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(item => item.classList.remove('active'));
        tab.classList.add('active');

        tabContents.forEach(content => content.classList.remove('active'));
        const targetTabContentId = tab.getAttribute('data-tab') + '-login-form';
        const targetContent = document.getElementById(targetTabContentId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});
//发送验证码
if (btnGetSmsCode) {
    btnGetSmsCode.addEventListener('click', function () {
        //先验证手机号
        const phone = document.getElementById("phone");
        if (!phone.value.trim()) {
            //手机号为空
            showError(phone, "请填写手机号");
            return;
        }
        else if (!validatePhoneNumber(phone.value)) {
            showError(phone, "手机号格式不正确");
            return;
        }
        clearError(phone);
        //注册发送验证码按钮的点击事件
        this.disabled = true;
        this.textContent = '发送中...';
        // 模拟发送成功后的倒计时
        setTimeout(() => {
            this.textContent = countdown + 's后重试';
            const interval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    this.textContent = countdown + 's后重试';
                } else {
                    clearInterval(interval);
                    this.textContent = '获取验证码';
                    this.disabled = false;
                    countdown = 60;
                }
            }, 1000);
        }, 1000); // 模拟网络延迟
    });
}
