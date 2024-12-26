import { Button, Form, Input } from "antd";
import { useFormik } from "formik";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.jsx";
import useRegister from "../../hooks/register.jsx";
import { jwtCheck } from "../../services/auth/jwt.js";

const RegisterPage = () => {
  const { register, loading, error } = useRegister(); // Using useRegister hook
  const navigate = useNavigate();
  const { setRegisterSuccess } = useContext(AuthContext);

  useEffect(() => {
    setRegisterSuccess(false);
    if (jwtCheck()) {
      navigate("/");
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: () => {
      const validation = true;
      return !validation
        ? {
            password:
              "Password needs to have at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
          }
        : undefined;
    },
    onSubmit: (values) => {
      register(values.username, values.password);
    },
  });

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Form
        name="basic"
        onFinish={formik.handleSubmit}
        style={{
          marginTop: 20,
          width: "50%",
          padding: 24,
          backgroundColor: "#fff",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
        layout="vertical"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input
            onChange={formik.handleChange}
            value={formik.values.username}
            name="username"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            onChange={formik.handleChange}
            value={formik.values.password}
            name="password"
          />
        </Form.Item>
        {formik.errors.password && (
          <div style={{ color: "red" }}>{formik.errors.password}</div>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
          <Button type="link">
            <Link to="/login">Login</Link>
          </Button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;
