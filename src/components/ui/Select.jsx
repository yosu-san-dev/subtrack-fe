import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import './Select.css';

const Select = ({ value, onChange, options, placeholder = 'Select an option' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val) => {
        onChange({ target: { value: val } });
        setIsOpen(false);
    };

    return (
        <div className="custom-select" ref={selectRef}>
            <div 
                className={clsx('select-trigger', { open: isOpen })} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <span className="material-symbols-outlined dropdown-icon">expand_more</span>
            </div>
            
            {isOpen && (
                <div className="select-dropdown glass-panel">
                    {options.length === 0 ? (
                        <div className="select-option disabled">No options available</div>
                    ) : (
                        options.map(opt => (
                            <div 
                                key={opt.value} 
                                className={clsx('select-option', { selected: opt.value === value })}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Select;
