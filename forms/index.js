
const forms = require('forms');

// just creating some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

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

// if allCategories is null, it will be an empty array
// if allTags is null, it will be an empty array
const createProductForm = (allCategories=[], allTags=[]) => {
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
        }),
        'category_id': fields.string({
            label: "Category",
            required: true,
            errorAfterField: true,

            // indicate that we want to display as select dropdown
            widget: widgets.select(),
            // choices must be an array of array
            // each inner array must have 2 elements
            // - index 0: the ID of the choice
            // - index 1: the display value of the choice
            choices: allCategories
        }),
        'tags': fields.string({
            'required': true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: allTags
        })
    })
}

const createUserForm = ()=>{
    return forms.create({
        'username': fields.string({
            required: true,
        }),
        'email': fields.email({
            required: true,
        }),
        'password': fields.password({
            required: true
        }),
        'confirm_password': fields.password({
            required: true,
            // the value entered for confirm_password field must match that
            // of the password field
            validators:[validators.matchField('password')]
        })
    })
}


const createLoginForm = ()=>{
    return forms.create({
        'email': fields.email({
            required: true,
        }),
        'password': fields.password({
            required: true
        })
    })
}

module.exports = { bootstrapField, createProductForm, createUserForm, createLoginForm}