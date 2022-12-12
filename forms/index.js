const forms = require('forms');

// just creating some shortcuts
const fields = forms.fields;
const validators = forms.validators;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createProductForm = () => {
    // use forms.create to create a new form object
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true
        }),
        'cost': fields.number({
            required: true,
            errorAfterField: true,
            // indicate the field must be an integeer
            // IMPORTANT: note the function call
            // in the array
            validators:[validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true
        })
    })
}

module.exports = { bootstrapField, createProductForm}