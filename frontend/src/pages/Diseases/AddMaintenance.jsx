import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { HomeOutlined, LeftOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Input, DatePicker, Form } from "antd";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { post } from "../../api/api";

const AddMaintenance = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fieldValidity, setFieldValidity] = useState({
    dateOfMaintenance: false,
    task: false,
    managerInCharge: false,
    progress: false,
  });

  const disableFutureDates = (current) => {
    return current && current > moment().endOf("day");
  };

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

  const alphabeticNumericRule = [
    {
      pattern: /^[a-zA-Z0-9\s]*$/,
      message: "Only alphabetic characters and numbers are allowed.",
    },
    {
      required: true,
      message: "This field is required.",
    },
  ];

  const alphabeticRule = [
    {
      pattern: /^[a-zA-Z\s]*$/,
      message: "Only alphabetic characters are allowed.",
    },
    {
      required: true,
      message: "This field is required.",
    },
  ];

  const numericRule = [
    {
      pattern: /[0-9]%/,
      message: "Only numeric characters are allowed.",
    },
    {
      required: true,
      message: "This field is required.",
    },
  ];

  const handleFinish = async (values) => {
    try {
      await post("/harvest", values);
      navigate("/Maintenance");
    } catch (error) {
      console.error("Error creating maintenance record:", error);
    }
  };

  const handleCancel = () => {
    navigate("/Maintenance");
  };

  const handleFieldChange = (changedFields, allFields) => {
    const newFieldValidity = { ...fieldValidity };

    allFields.forEach((field) => {
      if (field.errors.length === 0 && field.value) {
        newFieldValidity[field.name[0]] = true;
      } else {
        newFieldValidity[field.name[0]] = false;
      }
    });

    setFieldValidity(newFieldValidity);
  };

  return (
    <div>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-[300px] p-4 overflow-auto">
          <nav className="flex items-center justify-between p-4 bg-transparent">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              <LeftOutlined className="text-xl" />
            </button>
            <div className="flex space-x-4">
              <Link
                to="/diseases"
                className="text-[#3CCD65] hover:text-[#2b8f57]"
              >
                Home
              </Link>
              <Link
                to="/CoconutInspections"
                className="text-[#3CCD65] hover:text-[#2b8f57]"
              >
                Inspections
              </Link>
              <Link
                to="/CoconutTreatments"
                className="text-[#236A64] font-semibold"
              >
                Treatments
              </Link>
              <Link
                to="/pests-diseases"
                className="text-[#3CCD65] hover:text-[#2b8f57]"
              >
                Pests and Diseases
              </Link>
              <Link
                to="/maintenance"
                className="text-[#3CCD65] hover:text-[#2b8f57]"
              >
                Maintenance
              </Link>
              <Link
                to="/UserProfile"
                className="text-[#3CCD65] hover:text-[#2b8f57]"
              >
                My Profile
              </Link>
            </div>
          </nav>

          <div className="mt-4">
            <Breadcrumb
              items={[
                {
                  href: "",
                  title: <HomeOutlined />,
                },
                {
                  href: "",
                  title: "Add New Record for Maintenance",
                },
              ]}
            />
          </div>

          <div className="mt-4 p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold text-center">
              New Maintenance Record
            </h1>

            <Form
              form={form}
              layout="vertical"
              className="mt-6"
              onFinish={handleFinish}
              onFieldsChange={handleFieldChange}
            >
              <Form.Item
                label="Date of Maintenance"
                name="dateOfMaintenance"
                rules={[
                  {
                    required: true,
                    message: "Please select a date of maintenance.",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={disableFutureDates}
                  onChange={(date, dateString) => {
                    if (date && date > moment()) {
                      form.setFields([
                        {
                          name: "dateOfTreatment",
                          errors: [
                            "Please select a date that is not in the future.",
                          ],
                        },
                      ]);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Task"
                name="task"
                rules={alphabeticRule}
              >
                <Input
                  placeholder="Enter the task"
                  disabled={!fieldValidity.dateOfMaintenance}
                />
              </Form.Item>

              <Form.Item
                label="Manager in Charge"
                name="managerInCharge"
                rules={alphabeticRule}
              >
                <Input
                  placeholder="Enter the name of the manager in charge"
                  disabled={!fieldValidity.task}
                />
              </Form.Item>

              <Form.Item
                label="Progress"
                name="progress"
                rules={numericRule}
              >
                <Input
                  placeholder="Enter the percentage progress rate"
                  disabled={!fieldValidity.managerInCharge}
                />
              </Form.Item>


              <div className="flex justify-center space-x-4 mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ backgroundColor: "#236A64", color: "#fff" }}
                  onClick={handleFinish}
                >
                  Submit
                </Button>
                <Button type="default" htmlType="button" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMaintenance;
