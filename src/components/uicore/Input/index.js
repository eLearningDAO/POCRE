import { TextField, Autocomplete } from '@mui/material';
import { Box } from '@mui/system';
import { useFormContext } from 'react-hook-form';
import './index.css';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const inputVariants = {
  LIGHT: 'light',
  DARK: 'dark',
};

function Input(
  {
    type,
    name,
    placeholder,
    hookToForm,
    fullWidth,
    onChange,
    variant,
    autoComplete,
    autoCompleteOptions,
  },
) {
  const formContext = useFormContext();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(autoCompleteOptions || []);
  }, [autoCompleteOptions]);

  return (
    <Box width="100%">
      {autoComplete
        ? (
          <Autocomplete
            freeSolo
            fullWidth
            options={options}
            renderInput={(parameters) => (
              <TextField
                {...parameters}
                variant="standard"
                fullWidth={fullWidth}
                placeholder={placeholder}
                {...(hookToForm ? formContext.register(name) : {})}
                className={`input input-${variant} ${hookToForm && formContext?.formState?.errors?.[name]?.message ? 'input-error' : ''}`}
                onChange={onChange}
              />
            )}
          />
        )
        : (
          <TextField
            type={type}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            fullWidth={fullWidth}
            name={name}
            placeholder={placeholder}
            onChange={!hookToForm ? onChange : null}
            {...(hookToForm ? formContext.register(name) : {})}
            className={`input input-${variant} ${hookToForm && formContext?.formState?.errors?.[name]?.message ? 'input-error' : ''}`}
          />
        )}
      {
        hookToForm
        && formContext?.formState?.errors?.[name]?.message
        && <p className="input-error-p">{formContext?.formState?.errors?.[name]?.message}</p>
      }
    </Box>
  );
}

Input.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string,
  type: PropTypes.oneOf('text', 'date'),
  placeholder: PropTypes.string,
  hookToForm: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(inputVariants)),
  autoComplete: PropTypes.bool,
  autoCompleteOptions: PropTypes.arrayOf(PropTypes.string),
};

Input.defaultProps = {
  onChange: () => {},
  name: '',
  type: 'text',
  placeholder: '',
  hookToForm: false,
  fullWidth: true,
  variant: inputVariants.LIGHT,
  autoComplete: false,
  autoCompleteOptions: [],
};

export default Input;
