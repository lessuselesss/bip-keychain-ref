import React from "react";
export const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
export const CardContent = ({ children, ...props }) => <div {...props}>{children}</div>;
export const CardHeader = ({ children, ...props }) => <div {...props}>{children}</div>;
export const CardTitle = ({ children, ...props }) => <h2 {...props}>{children}</h2>;