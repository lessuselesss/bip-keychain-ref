import React from 'react';

// A simple mock that renders a native select element.
// This is enough to test the functionality of the component using it.
export const Select = ({ children, value, onValueChange, ...props }) => {
    // The component passes SelectTrigger and SelectContent. We need to extract the SelectItems from the content.
    const kids = React.Children.toArray(children);
    const content = kids.find(k => k.type === SelectContent);
    const options = content ? content.props.children : [];

    return (
        <select value={value} onChange={(e) => onValueChange(e.target.value)} {...props} role="combobox">
            {options}
        </select>
    );
};
export const SelectTrigger = ({ children }) => <>{children}</>; // Render nothing, as select will be the trigger
export const SelectContent = ({ children }) => <>{children}</>; // Just a container for options
export const SelectItem = ({ children, ...props }) => <option {...props}>{children}</option>;
export const SelectValue = ({ placeholder }) => <>{/* We can't easily show a placeholder in a native select like this, so we render nothing. The label is separate anyway. */}</>;