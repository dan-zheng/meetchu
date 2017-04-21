export function validationStyle(field, showSuccess) {
  if (typeof showSuccess === 'undefined') {
    showSuccess = true;
  }
  if (!field) {
    return '';
  }
  if ((field.$touched || field.$submitted) && field.$valid) {
    if (showSuccess) {
      return 'has-success';
    } else {
      return '';
    }
  }
  if ((field.$touched || field.$submitted) && field.$invalid) {
    return 'has-danger';
  }
}

export function resetForm(formstate) {
  Object.keys(formstate)
    .filter(k => k[0] !== '$' && k[0] !== '_')
    .forEach(k => {
      const field = formstate[k];
      field._setPristine();
      field._setUntouched();
    });
}
