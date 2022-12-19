import {
  Select as MuiSelect,
} from '@mui/material';
import { Box } from '@mui/system';
import { useFormContext } from 'react-hook-form';
import './index.css';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';

const selectVariants = {
  LIGHT: 'light',
  DARK: 'dark',
};

function Option({
  children, value,
}) {
  return <MenuItem value={value}>{children}</MenuItem>;
}

function Select(
  {
    name,
    placeholder,
    hookToForm,
    fullWidth,
    onChange,
    variant,
    options,
  },
) {
  const [isOpen, setIsOpen] = useState(false);
  const formContext = useFormContext();
  const controlProperties = hookToForm ? formContext.register(name) : {};

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Box width="100%">
      <MuiSelect
        fullWidth={fullWidth}
        style={{ border: 'none', outline: 'none' }}
        SelectDisplayProps={{
          style: { border: 'none', padding: 0 },
        }}
        {...(placeholder && !isOpen && { value: hookToForm ? formContext?.getValues(name) : '' })}
        className={`select select-${variant} ${hookToForm && formContext?.formState?.errors?.[name]?.message ? 'select-error' : ''}`}
        displayEmpty={!!placeholder}
        onOpen={handleOpen}
        onClose={handleClose}
        {...controlProperties}
        onChange={async (event) => {
          if (hookToForm) {
            await controlProperties.onChange(event);
          }

          if (onChange) await onChange(event);
        }}
      >
        {placeholder && <MenuItem selected value="" style={{ textTransform: 'capitalize' }}>{placeholder}</MenuItem>}
        {options?.map((x, index) => <MenuItem key={index} value={x?.value} style={{ textTransform: 'capitalize' }}>{x?.label}</MenuItem>)}
      </MuiSelect>
      {
        hookToForm
        && formContext?.formState?.errors?.[name]?.message
        && <p>{formContext?.formState?.errors?.[name]?.message}</p>
      }
    </Box>
  );
}

Select.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  hookToForm: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(selectVariants)),
  children: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
};

Select.defaultProps = {
  onChange: () => {},
  name: '',
  placeholder: '',
  hookToForm: false,
  fullWidth: true,
  variant: selectVariants.LIGHT,
  children: null,
  options: [],
};

Select.Option = Option;

export default Select;
