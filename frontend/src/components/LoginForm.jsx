import { Form, Input, Button } from "antd";

const LoginForm = () => {
  const onFinish = (values) => {
    console.log("Success:", values);
    // Gọi API backend để đăng nhập ở đây
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Tên đăng nhập"
        name="username"
        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
