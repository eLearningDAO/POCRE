/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Box } from '@mui/system';
import { Chip } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import './index.css';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

const tagInputVariants = {
  LIGHT: 'light',
  DARK: 'dark',
};

function useOutsideAlerter(reference, setOpen) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (reference.current && !reference.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reference]);
}

let isFirstValidationSkipped = false;

function TagInput(
  {
    name,
    placeholder,
    hookToForm,
    onInput,
    variant,
    tagSuggestions,
  },
) {
  const formContext = useFormContext();
  const inputReference = useRef();
  const [placeholderVisiable, setPlaceholderVisiable] = useState(true);
  const [tags, setTags] = useState([]);
  const [tagsSuggestionsToDisplay, setTagSuggestionsToDisplay] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperReference = useRef(null);

  useOutsideAlerter(wrapperReference, setShowSuggestions);

  useEffect(() => {
    if (hookToForm) {
      formContext.register(name);
      const defaultValue = formContext.getValues(name);
      if (defaultValue) {
        setTags(defaultValue);
      }
    }
  }, []);

  useEffect(() => {
    const newTagSuggestions = [];

    tagSuggestions.map(
      (x) => !tags.includes(x)
      && x.includes(inputValue)
      && newTagSuggestions.push(x),
    );

    setTagSuggestionsToDisplay(newTagSuggestions);
  }, [tags, inputValue]);

  useEffect(() => {
    formContext.setValue(name, tags, { shouldDirty: true });
    if (!isFirstValidationSkipped) {
      isFirstValidationSkipped = true;
      return;
    }
    formContext.trigger([name]);
  }, [tags]);

  const focusInput = (event) => {
    const { classList } = event.target;

    if (
      classList
      && inputReference.current
      && (classList.contains('tag-input-container') || classList.contains('tag-placeholder') || classList.contains('tag-input'))
    ) {
      inputReference.current.focus();
      setShowSuggestions(true);
    }
  };

  const onInputFocus = () => setPlaceholderVisiable(false);

  const onInputBlur = () => {
    if (
      placeholder
      && inputReference.current
      && inputReference.current?.value?.trim()?.length === 0
      && tags.length === 0
    ) {
      setPlaceholderVisiable(true);
    }
  };

  const onInputKeyUp = (event) => {
    if (event.code === 'Enter') {
      event.preventDefault();
      const value = inputReference.current.value.trim();
      if (value.length === 0) return;

      const newTags = [...tags, value];
      setTags(newTags);

      inputReference.current.value = '';
    }

    if (event.code === 'Backspace' && inputReference.current.value.length === 0) {
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter((x) => x !== tag);
    setTags(newTags);
    if (newTags.length === 0) setPlaceholderVisiable(true);
  };

  const addTagSuggestion = (tag) => {
    const newTags = [...tags, tag];
    setTags(newTags);
  };

  const onInputChange = async (event) => {
    if (onInput) await onInput(event);
    setInputValue(event.target.value.trim());
  };

  return (
    <Box width="100%" position="relative" ref={wrapperReference}>
      {/* tag input */}
      <div
        onClick={focusInput}
        className={`input input-${variant} tag-input-container ${hookToForm && formContext?.formState?.errors?.[name]?.message ? 'input-error' : ''}`}
      >
        {tags.length === 0 && placeholder && placeholderVisiable && <span className="tag-placeholder">{placeholder}</span>}

        {tags.map((tag) => (
          <Chip key={tag} className="tag" label={tag} onDelete={() => removeTag(tag)} />
        ))}

        <input type="text" onChange={onInputChange} onKeyUp={onInputKeyUp} onFocus={onInputFocus} onBlur={onInputBlur} className="tag-input" ref={inputReference} />
      </div>

      {/* suggestions box */}
      {showSuggestions && tagsSuggestionsToDisplay.length > 0 && (
      <div className="tag-suggestions-container input input-dark">
        {tagsSuggestionsToDisplay.map((tag) => (
          tags.includes(tag) ? null : (
            <button type="button" className="tag-suggestion" onClick={() => addTagSuggestion(tag)}>
              {tag}
            </button>
          )
        ))}
      </div>
      )}

      {/* error hint */}
      {
        hookToForm
        && formContext?.formState?.errors?.[name]?.message
        && <p>{formContext?.formState?.errors?.[name]?.message}</p>
      }
    </Box>
  );
}

TagInput.propTypes = {
  onInput: PropTypes.func,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  hookToForm: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(tagInputVariants)),
  tagSuggestions: PropTypes.arrayOf(PropTypes.string),
};

TagInput.defaultProps = {
  onInput: () => {},
  name: '',
  placeholder: '',
  hookToForm: false,
  variant: tagInputVariants.LIGHT,
  tagSuggestions: [],
};

export default TagInput;
