/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Chip } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import './index.css';

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

// only use tags as object if the user is
// not allowed to add custom tags
function TagInput(
  {
    name,
    placeholder,
    hookToForm,
    onInput,
    variant,
    tagSuggestions,
    maxTags = 1000,
    addTagOnEnter = true,
    selectedTags = [],
  },
) {
  const formContext = useFormContext();
  const inputReference = useRef();
  const [placeholderVisiable, setPlaceholderVisiable] = useState(true);
  const [tags, setTags] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [internalTagSuggestions, setTagSuggestions] = useState([]);
  const [tagsSuggestionsToDisplay, setTagSuggestionsToDisplay] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperReference = useRef(null);

  useOutsideAlerter(wrapperReference, setShowSuggestions);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const isTagObject = (tag) => (typeof tag === 'object' ? (tag?.id && tag?.label ? true : null) : false);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getTagString = (tag) => (isTagObject(tag) ? tag.label : tag);

  const hasTagSuggestion = (tag) => (isTagObject(tag)
    ? tags.findIndex((y) => y?.label?.includes(tag?.label)) > -1
    : tags.includes(tag));

  const updateTagSuggestions = useCallback((newTags = [], existingTags = []) => {
    const newTagSuggestions = [];

    newTags.map(
      (x) => {
        if (typeof x === 'string' && !existingTags.includes(x) && x.includes(inputValue)) {
          newTagSuggestions.push(x);
        }

        if (isTagObject(x) && x?.label?.includes(inputValue)) {
          newTagSuggestions.push(x);
        }

        return null;
      },
    );

    setTagSuggestionsToDisplay(newTagSuggestions);
  }, [setTagSuggestionsToDisplay]);

  useEffect(() => {
    if (hookToForm) {
      formContext.register(name);
      const defaultValue = formContext.getValues(name);
      if (defaultValue) setTags(defaultValue);
    }
  }, []);

  useEffect(() => {
    updateTagSuggestions(internalTagSuggestions, tags);
  }, [tags, inputValue]);

  useEffect(() => {
    formContext.setValue(name, tags, { shouldDirty: isFirstValidationSkipped });
    if (!isFirstValidationSkipped) {
      isFirstValidationSkipped = true;
      return;
    }
    formContext.trigger([name]);
  }, [tags]);

  useEffect(() => {
    if (selectedTags && selectedTags.length > 0) {
      formContext.setValue(name, selectedTags, { shouldDirty: isFirstValidationSkipped });
      formContext.trigger([name]);
      setTags(selectedTags);
      if (inputReference && inputReference.current) { inputReference.current.value = ''; }
    }
  }, [selectedTags]);

  useEffect(() => {
    setShowSuggestions(isFocused && tagSuggestions.length > 0);

    updateTagSuggestions(tagSuggestions, tags);

    setTagSuggestions(tagSuggestions);
  }, [tagSuggestions]);

  const addTagSuggestion = (tag) => {
    if (tags.length < maxTags) {
      const newTags = [...tags, tag];
      setTags(newTags);

      inputReference.current.value = '';
    }
  };

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

  const onInputFocus = () => {
    setIsFocused(true);
    setPlaceholderVisiable(false);
  };

  const onInputBlur = () => {
    setIsFocused(false);
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
    if (event.code === 'Enter' && addTagOnEnter) {
      event.preventDefault();
      const value = inputReference.current.value.trim();
      if (value.length === 0) return;

      addTagSuggestion(value); // this wont work if original tags are object

      inputReference.current.value = '';
    }

    if (event.code === 'Backspace' && inputReference.current.value.length === 0) {
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const removeTag = (tag) => {
    const isTagAnObject = isTagObject(tag);
    const newTags = tags.filter((x) => (isTagAnObject ? x.label !== tag.label : x !== tag));
    setTags(newTags);
    if (
      newTags.length === 0 && inputReference.current.value.length === 0
    ) setPlaceholderVisiable(true);
  };

  const onInputChange = async (event) => {
    if (tags.length === maxTags) {
      inputReference.current.value = '';
      return;
    }

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

        {tags.map((tag, index) => (
          <Chip key={index} className="tag" label={getTagString(tag)} onDelete={() => removeTag(tag)} />
        ))}

        <input type="text" onChange={onInputChange} onKeyUp={onInputKeyUp} onFocus={onInputFocus} onBlur={onInputBlur} className="tag-input" ref={inputReference} />
      </div>

      {/* suggestions box */}
      {showSuggestions && tagsSuggestionsToDisplay.length > 0 && (
        <div className="tag-suggestions-container input input-dark">
          {tagsSuggestionsToDisplay.map((tag, index) => (
            hasTagSuggestion(tag) ? null : (
              <button key={index} type="button" className="tag-suggestion" onClick={() => addTagSuggestion(tag)}>
                {getTagString(tag)}
              </button>
            )
          ))}
        </div>
      )}

      {/* error hint */}
      {
        !showSuggestions
        && hookToForm
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
