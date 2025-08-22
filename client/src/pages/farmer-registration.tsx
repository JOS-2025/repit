import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FarmerRegistrationForm {
  fullName: string;
  phoneNumber: string;
  email: string;
  farmLocation: string;
  farmType: string;
  farmImage: FileList;
}

export default function FarmerRegistration() {
  const { register, handleSubmit, formState: { errors } } = useForm<FarmerRegistrationForm>();
  const { toast } = useToast();
  
  const registerFarmerMutation = useMutation({
    mutationFn: async (data: FarmerRegistrationForm) => {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("email", data.email);
      formData.append("farmLocation", data.farmLocation);
      formData.append("farmType", data.farmType);
      if (data.farmImage[0]) {
        formData.append("farmImage", data.farmImage[0]);
      }
      
      return apiRequest("POST", "/api/register-farmer", formData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your farmer registration has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FarmerRegistrationForm) => {
    registerFarmerMutation.mutate(data);
  };

  return (
    <>
      <style>{`
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f8f9fa;
            color: #333;
        }
        .farmer-header {
            background: #16a34a;
            color: #fff;
            text-align: center;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
        }
        .farmer-container {
            max-width: 900px;
            margin: 30px auto;
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .farmer-h1 {
            color: #16a34a;
            text-align: center;
        }
        .farmer-intro {
            text-align: center;
            margin-bottom: 20px;
        }
        .farmer-benefits {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .farmer-benefit-card {
            background: #e7f8ed;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
        }
        .farmer-form {
            margin-top: 20px;
        }
        .farmer-input, .farmer-select {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border-radius: 6px;
            border: 1px solid #ccc;
            font-size: 16px;
            box-sizing: border-box;
        }
        .farmer-button {
            background: #16a34a;
            color: #fff;
            border: none;
            padding: 14px;
            width: 100%;
            font-size: 18px;
            border-radius: 8px;
            cursor: pointer;
        }
        .farmer-button:hover {
            background: #128c3f;
        }
        .farmer-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .farmer-steps {
            margin: 30px 0;
            text-align: center;
        }
        .farmer-steps h2 {
            color: #16a34a;
            margin-bottom: 10px;
        }
        .farmer-steps ul {
            list-style: none;
            padding: 0;
        }
        .farmer-steps ul li {
            margin: 10px 0;
            font-size: 18px;
        }
        .farmer-cta {
            text-align: center;
            margin-top: 20px;
        }
        .farmer-cta a {
            display: inline-block;
            background: #16a34a;
            color: #fff;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
        }
        .farmer-cta a:hover {
            background: #128c3f;
        }
        .farmer-error {
            color: #ef4444;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
      `}</style>

      <div className="farmer-header">FarmCart – Become a Farmer</div>

      <div className="farmer-container">
        <h1 className="farmer-h1">Join FarmCart Today!</h1>
        <p className="farmer-intro">Sell your fresh produce directly to customers. No middlemen, better profits!</p>

        <h2>Benefits of Joining</h2>
        <div className="farmer-benefits">
          <div className="farmer-benefit-card">✅ Higher Profit Margins</div>
          <div className="farmer-benefit-card">✅ Instant Payments (M-Pesa)</div>
          <div className="farmer-benefit-card">✅ Wide Customer Reach</div>
          <div className="farmer-benefit-card">✅ Free Marketing Support</div>
        </div>

        <h2>Registration Form</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="farmer-form">
          <input
            {...register("fullName", { required: "Full name is required" })}
            type="text"
            placeholder="Full Name"
            className="farmer-input"
            data-testid="input-full-name"
          />
          {errors.fullName && (
            <p className="farmer-error">{errors.fullName.message}</p>
          )}

          <input
            {...register("phoneNumber", { required: "Phone number is required" })}
            type="tel"
            placeholder="Phone Number"
            className="farmer-input"
            data-testid="input-phone"
          />
          {errors.phoneNumber && (
            <p className="farmer-error">{errors.phoneNumber.message}</p>
          )}

          <input
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            type="email"
            placeholder="Email Address"
            className="farmer-input"
            data-testid="input-email"
          />
          {errors.email && (
            <p className="farmer-error">{errors.email.message}</p>
          )}

          <input
            {...register("farmLocation", { required: "Farm location is required" })}
            type="text"
            placeholder="Farm Location"
            className="farmer-input"
            data-testid="input-farm-location"
          />
          {errors.farmLocation && (
            <p className="farmer-error">{errors.farmLocation.message}</p>
          )}
          
          <select
            {...register("farmType", { required: "Please select farm type" })}
            className="farmer-select"
            data-testid="select-farm-type"
          >
            <option value="">Select Farm Type</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="livestock">Livestock</option>
          </select>
          {errors.farmType && (
            <p className="farmer-error">{errors.farmType.message}</p>
          )}

          <input
            {...register("farmImage", { required: "Farm image is required" })}
            type="file"
            accept="image/*"
            className="farmer-input"
            data-testid="input-farm-image"
          />
          {errors.farmImage && (
            <p className="farmer-error">{errors.farmImage.message}</p>
          )}

          <button
            type="submit"
            disabled={registerFarmerMutation.isPending}
            className="farmer-button"
            data-testid="button-register-farmer"
          >
            {registerFarmerMutation.isPending ? 'Registering...' : 'Register as a Farmer'}
          </button>
        </form>

        <div className="farmer-steps">
          <h2>How It Works</h2>
          <ul>
            <li>✅ Sign Up as a Farmer</li>
            <li>✅ Add Your Products</li>
            <li>✅ Start Selling</li>
            <li>✅ Get Paid Instantly</li>
          </ul>
        </div>

        <div className="farmer-cta">
          <a href="/api/login">Already a Farmer? Log in</a>
        </div>
      </div>
    </>
  );
}