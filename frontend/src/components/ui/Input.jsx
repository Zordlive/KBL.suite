import React from 'react';

const Input = ({ maxLength, ...props }) => {
  return (
    <input
      className="flex h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-indigo-500 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100"
      maxLength={maxLength}
      {...props}
    />
  );
};

export default Input;