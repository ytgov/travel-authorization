# Policies

Polcies match controller methods and control access to controller actions. They should return a boolean result. General pattern taken from https://github.com/varvet/pundit.

Each policy accepts a record and the current user. To simplify the testing of policies, policies should remain synchronous.

Examples of usage:

```typescript
export class FormsController extends BaseController {
  async update() {
    const form = await this.loadForm()
    if (isNil(form)) return this.response.status(404).json({ message: "Form not found." })

    if (!FormsPolicy.update(form, this.currentUser)) {
      return this.response.status(403).json({ message: "You are not authorized to view this form." })
    }

    return FormService.update(this.params.formId, this.request.body)
      .then((form) => {
        this.response.json({ form })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Form update failed: ${error}` })
      })
  }

  private loadForm(): Promise<Form> {
    return Form.findByPk(this.params.formId)
  }
}
```

## Future

Use a policy library like https://casl.js.org/v6/en/guide/intro
