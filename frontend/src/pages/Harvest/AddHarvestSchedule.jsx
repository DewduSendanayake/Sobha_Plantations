import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  TimePicker,
  notification,
} from "antd";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Swal from "sweetalert2";

const { Option } = Select;

const AddHarvestSchedule = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Define loading state for managing form submission
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const fields = [
    "cropType",
    "harvestDate",
    "startTime",
    "endTime",
    "fieldNumber",
    "numberOfWorkers",
  ];

  // Completion states for each field
  const [cropTypeComplete, setCropTypeComplete] = useState(false);
  const [harvestDateComplete, setHarvestDateComplete] = useState(false);
  const [startTimeComplete, setStartTimeComplete] = useState(false);
  const [endTimeComplete, setEndTimeComplete] = useState(false);
  const [fieldNumberComplete, setFieldNumberComplete] = useState(false);
  const [numberOfWorkers, setnumberOfWorkers] = useState(false);

  // Function to disable past dates
  const disablePastAndFutureDates = (current) => {
    // Disable dates before today and after the end of the current year
    return current && (current < moment().startOf('day') || current > moment().endOf('year'));
  };
  // Confirm submission
  const handleSubmit = async (values) => {
    const isFormValid = form
      .getFieldsError()
      .every(({ errors }) => errors.length === 0);
    if (!isFormValid) return;

    const result = await Swal.fire({
      title: "Confirmation Required",
      text: "Are you sure you want to submit this harvest schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, cancel!",
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        html: "swal-custom-html",
        confirmButton: "swal-confirm-button",
        cancelButton: "swal-cancel-button",
      },
      focusCancel: false,
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        // Extract form values and format time
        const {
          cropType,
          harvestDate,
          startTime,
          endTime,
          fieldNumber,
          numberOfWorkers,
        } = values;

        const payload = {
          cropType,
          harvestDate: harvestDate ? harvestDate.toISOString() : null,
          startTime: startTime ? startTime.format("HH:mm") : null,
          endTime: endTime ? endTime.format("HH:mm") : null,
          fieldNumber,
          numberOfWorkers,
        };

        await axios.post("http://localhost:5000/api/harvest", payload);

        Swal.fire("Success", "Harvest Schedule added successfully!", "success");
        form.resetFields();
        setLoading(false);
        navigate("/harvest/harvest-schedule");
      } catch (error) {
        setLoading(false);
        notification.error({
          message: "Error",
          description: "There was an error adding the harvest schedule.",
        });
      }
    }
  };

  const handleFieldChange = (name, value) => {
    const currentIndex = fields.indexOf(name);
    if (currentIndex > 0) {
      const previousField = fields[currentIndex - 1];
      if (errors[previousField] || !formData[previousField]) {
        return; // Block current field if previous has errors or is empty
      }
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFieldsError = (errorInfo) => {
    const newErrors = errorInfo.reduce((acc, { name, errors }) => {
      acc[name[0]] = errors.length > 0;
      return acc;
    }, {});
    setErrors(newErrors);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Header />
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-center">
              Add Harvest Schedule
            </h2>
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              onFieldsChange={(_, allFields) => handleFieldsError(allFields)}
            >
              {/* Crop Type */}
              <Form.Item
                label="Crop Type"
                name="cropType"
                rules={[
                  { required: true, message: "Please select a crop type!" },
                ]}
              >
                <Select
                  placeholder="Select a crop type"
                  onChange={(value) => handleFieldChange("cropType", value)}
                  style={{ width: "100%" }}
                >
                  <Option value="Coconut">Coconut</Option>
                  <Option value="Banana">Banana</Option>
                  <Option value="Pepper">Pepper</Option>
                  <Option value="Papaya">Papaya</Option>
                  <Option value="Pineapple">Pineapple</Option>
                </Select>
              </Form.Item>

              {/* Harvest Date */}
              <Form.Item
  label="Harvest Date"
  name="harvestDate"
  rules={[
    {
      required: true,
      message: "Please select the harvest date!",
    },
  ]}
>
  <DatePicker
    format="YYYY-MM-DD"
    disabledDate={disablePastAndFutureDates}
    disabled={!formData.cropType} // Enable only when crop type is selected
    onChange={(date) => handleFieldChange("harvestDate", date)}
    style={{ width: "100%" }}
    inputReadOnly
  />
</Form.Item>
              {/* Start Time */}
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[
                  { required: true, message: "Please select the start time!" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  disabled={!formData.cropType || !formData.harvestDate} // Enable only when crop type and harvest date are selected
                  onChange={(time) => handleFieldChange("startTime", time)}
                  style={{ width: "100%" }}
                  inputReadOnly // Prevent typing in the input field
                  renderExtraFooter={() => (
                    <input
                      onPaste={(e) => e.preventDefault()} // Prevent pasting
                      style={{ display: "none" }} // Hide input, used only for handling the paste event
                    />
                  )}
                />
              </Form.Item>

              {/* End Time */}
              <Form.Item
                label="End Time"
                name="endTime"
                rules={[
                  { required: true, message: "Please select the end time!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value.isAfter(getFieldValue("startTime"))) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("End time must be after the start time!")
                      );
                    },
                  }),
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  disabled={
                    !formData.cropType ||
                    !formData.harvestDate ||
                    !formData.startTime
                  }
                  onChange={(time) => handleFieldChange("endTime", time)}
                  style={{ width: "100%" }}
                  renderExtraFooter={() => (
                    <input
                      onPaste={(e) => e.preventDefault()} // Prevent pasting
                      style={{ display: "none" }} // Hide the input field, just to make the feature explicit in TimePicker
                    />
                  )}
                  inputReadOnly // This will prevent direct typing in the input field
                />
              </Form.Item>

              {/* Field Number */}
              <Form.Item
                label="Field Number"
                name="fieldNumber"
                rules={[
                  { required: true, message: "Please select a field number!" },
                ]}
              >
                <Select
                  placeholder="Select a field number"
                  disabled={
                    !formData.cropType ||
                    !formData.harvestDate ||
                    !formData.startTime ||
                    !formData.endTime
                  } // Enable only when crop type is selected
                  onChange={(value) => handleFieldChange("fieldNumber", value)}
                  style={{ width: "100%" }} // Enable only when harvest date is selected
                >
                  <Option value="AA1">AA1</Option>
                  <Option value="BB1">BB1</Option>
                  <Option value="CC1">CC1</Option>
                  <Option value="DD1">DD1</Option>
                </Select>
              </Form.Item>

              {/* Number of Workers */}
              <Form.Item
                label="Number of Workers"
                name="numberOfWorkers"
                rules={[
                  { required: true, message: "Number of workers is required!" },
                  {
                    pattern: /^\d+$/,
                    message: "Number of workers must be numeric",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const parsedValue = parseInt(value, 10);
                      if (!value || (parsedValue >= 1 && parsedValue <= 40)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Number of workers must be between 1 and 40!")
                      );
                    },
                  }),
                ]}
              >
                <Input
                  placeholder="Enter Number of Workers"
                  type="number"
                  min={1}
                  max={40}
                  disabled={
                    !formData.cropType ||
                    !formData.harvestDate ||
                    !formData.startTime ||
                    !formData.endTime ||
                    !formData.fieldNumber
                  }
                  onChange={(e) =>
                    handleFieldChange("numberOfWorkers", e.target.value)
                  }
                  onPaste={(e) => e.preventDefault()} // Prevent pasting
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault(); // Prevent non-numeric input
                    }
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  disabled={
                    !formData.cropType ||
                    !formData.harvestDate ||
                    !formData.startTime ||
                    !formData.endTime ||
                    !formData.fieldNumber ||
                    !formData.numberOfWorkers
                  }
                >
                  Add Schedule
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHarvestSchedule;
