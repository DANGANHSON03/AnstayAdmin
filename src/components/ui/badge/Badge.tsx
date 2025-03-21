import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "destructive" | "warning" | "secondary";
  className?: string;
}

const Badge = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => {
  const baseStyle =
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    destructive: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    secondary: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
