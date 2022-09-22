import { TextField } from '@mui/material';
import { Box } from '@mui/system';
import { useFormContext } from 'react-hook-form';
import './index.css';
import PropTypes from 'prop-types';

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
  },
) {
  const formContext = useFormContext();

  return (
    <Box width="100%">
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
      {
        hookToForm
        && formContext?.formState?.errors?.[name]?.message
        && <p>{formContext?.formState?.errors?.[name]?.message}</p>
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
};

Input.defaultProps = {
  onChange: () => {},
  name: '',
  type: 'text',
  placeholder: '',
  hookToForm: false,
  fullWidth: true,
  variant: inputVariants.LIGHT,
};

export default Input;
