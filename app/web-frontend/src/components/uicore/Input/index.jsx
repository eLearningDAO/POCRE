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
    id,
    type,
    name,
    placeholder,
    hookToForm,
    fullWidth,
    onChange,
    onInput,
    variant,
    autoComplete,
    autoCompleteOptions,
    multiline,
    minRows,
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
            onChange={onChange}
            onInput={onInput}
            renderInput={(parameters) => (
              <TextField
                id={id}
                {...parameters}
                variant="standard"
                fullWidth={fullWidth}
                placeholder={placeholder}
                {...(hookToForm ? formContext.register(name) : {})}
                onChange={onChange}
                className={`input input-${variant} ${hookToForm && formContext?.formState?.errors?.[name]?.message ? 'input-error' : ''}`}
              />
            )}
          />
        )
        : (
          <TextField
            id={id}
            type={type}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            {...(multiline && { multiline, minRows })}
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
  onInput: PropTypes.func,
  name: PropTypes.string,
  type: PropTypes.oneOf('text', 'date'),
  placeholder: PropTypes.string,
  hookToForm: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(inputVariants)),
  autoComplete: PropTypes.bool,
  autoCompleteOptions: PropTypes.arrayOf(PropTypes.string),
  multiline: PropTypes.bool,
  minRows: PropTypes.number,
};

Input.defaultProps = {
  onChange: () => {},
  onInput: () => {},
  name: '',
  type: 'text',
  placeholder: '',
  hookToForm: false,
  fullWidth: true,
  variant: inputVariants.LIGHT,
  autoComplete: false,
  autoCompleteOptions: [],
  multiline: false,
  minRows: 5,
};

export default Input;
