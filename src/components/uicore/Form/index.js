/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

// Define path of native element in firebox/safari/opera
if (!('path' in Event.prototype)) {
  Object.defineProperty(Event.prototype, 'path', {
    get() {
      const path = [];
      let currentElement = this.target;
      while (currentElement) {
        path.push(currentElement);
        currentElement = currentElement.parentElement;
      }
      if (!path.includes(window) && !path.includes(document)) path.push(document);
      if (!path.includes(window)) path.push(window);
      return path;
    },
  });
}

function Form({
  onSubmit,
  validationSchema,
  children,
  className,
  initialValues,
  preventSubmitOnEnter,
}) {
  const formMethods = useForm({
    resolver: joiResolver(validationSchema),
    defaultValues: initialValues,
  });

  const handleFormSubmit = async (event) => {
    await formMethods.handleSubmit(onSubmit)(event);
  };

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter'
      && preventSubmitOnEnter
      && event?.nativeEvent?.path?.[0]?.form?.[event.nativeEvent.path[0].form.length - 2]
    === event.target) {
      event.preventDefault();
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form
        onKeyDown={handleKeyDown}
        onSubmit={handleFormSubmit}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  );
}

Form.propTypes = {
  onSubmit: PropTypes.func,
  children: PropTypes.node,
  // eslint-disable-next-line react/forbid-prop-types
  validationSchema: PropTypes.any.isRequired,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  initialValues: PropTypes.object,
  preventSubmitOnEnter: PropTypes.bool,
};

Form.defaultProps = {
  onSubmit: () => {},
  children: '',
  className: '',
  initialValues: {},
  preventSubmitOnEnter: false,
};

export default Form;
