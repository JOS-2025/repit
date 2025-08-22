import { useState } from "react";
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
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0,
      background: '#f8f9fa',
      color: '#333',
      minHeight: '100vh'
    }}>
      <header style={{
        background: '#16a34a',
        color: '#fff',
        textAlign: 'center',
        padding: '20px',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        FarmCart – Become a Farmer
      </header>

      <div style={{
        maxWidth: '900px',
        margin: '30px auto',
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          color: '#16a34a',
          textAlign: 'center'
        }}>
          Join FarmCart Today!
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Sell your fresh produce directly to customers. No middlemen, better profits!
        </p>

        <h2>Benefits of Joining</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          margin: '20px 0'
        }}>
          <div style={{
            background: '#e7f8ed',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✅ Higher Profit Margins
          </div>
          <div style={{
            background: '#e7f8ed',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✅ Instant Payments (M-Pesa)
          </div>
          <div style={{
            background: '#e7f8ed',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✅ Wide Customer Reach
          </div>
          <div style={{
            background: '#e7f8ed',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✅ Free Marketing Support
          </div>
        </div>

        <h2>Registration Form</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '20px' }}>
          <input
            {...register("fullName", { required: "Full name is required" })}
            type="text"
            placeholder="Full Name"
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            data-testid="input-full-name"
          />
          {errors.fullName && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>
              {errors.fullName.message}
            </p>
          )}

          <input
            {...register("phoneNumber", { required: "Phone number is required" })}
            type="tel"
            placeholder="Phone Number"
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            data-testid="input-phone"
          />
          {errors.phoneNumber && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>
              {errors.phoneNumber.message}
            </p>
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
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            data-testid="input-email"
          />
          {errors.email && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>
              {errors.email.message}
            </p>
          )}

          <input
            {...register("farmLocation", { required: "Farm location is required" })}
            type="text"
            placeholder="Farm Location"
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            data-testid="input-farm-location"
          />
          {errors.farmLocation && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>
              {errors.farmLocation.message}
            </p>
          )}
          
          <select
            {...register("farmType", { required: "Please select farm type" })}
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            data-testid="select-farm-type"
          >
            <option value="">Select Farm Type</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="livestock">Livestock</option>
          </select>
          {errors.farmType && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>
              {errors.farmType.message}
            </p>
          )}

          <input
            {...register("farmImage", { required: "Farm image is required" })}
            type="file"
            accept="image/*"
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            data-testid="input-farm-image"
          />
          {errors.farmImage && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>
              {errors.farmImage.message}
            </p>
          )}

          <button
            type="submit"
            disabled={registerFarmerMutation.isPending}
            style={{
              background: registerFarmerMutation.isPending ? '#9ca3af' : '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '14px',
              width: '100%',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: registerFarmerMutation.isPending ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!registerFarmerMutation.isPending) {
                e.currentTarget.style.background = '#128c3f';
              }
            }}
            onMouseLeave={(e) => {
              if (!registerFarmerMutation.isPending) {
                e.currentTarget.style.background = '#16a34a';
              }
            }}
            data-testid="button-register-farmer"
          >
            {registerFarmerMutation.isPending ? 'Registering...' : 'Register as a Farmer'}
          </button>
        </form>

        <div style={{
          margin: '30px 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#16a34a',
            marginBottom: '10px'
          }}>
            How It Works
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0
          }}>
            <li style={{
              margin: '10px 0',
              fontSize: '18px'
            }}>
              ✅ Sign Up as a Farmer
            </li>
            <li style={{
              margin: '10px 0',
              fontSize: '18px'
            }}>
              ✅ Add Your Products
            </li>
            <li style={{
              margin: '10px 0',
              fontSize: '18px'
            }}>
              ✅ Start Selling
            </li>
            <li style={{
              margin: '10px 0',
              fontSize: '18px'
            }}>
              ✅ Get Paid Instantly
            </li>
          </ul>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <a
            href="/api/login"
            style={{
              display: 'inline-block',
              background: '#16a34a',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#128c3f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#16a34a';
            }}
            data-testid="link-farmer-login"
          >
            Already a Farmer? Log in
          </a>
        </div>
      </div>
    </div>
  );
}