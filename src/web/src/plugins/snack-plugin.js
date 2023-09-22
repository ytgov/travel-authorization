function getContrastingColor(color) {
  const colorMap = {
    primary: "white",
    secondary: "black",
    accent: "black",
    error: "white",
    info: "white",
    success: "white",
    warning: "black",
  }

  return colorMap[color] || "white"
}

const SnackPlugin = {
  install(Vue, defaultOptions = { timeout: 4000 }) {
    const SnackComponent = Vue.extend({
      render(h) {
        const contrastingColor = getContrastingColor(this.options.color)
        return h(
          "v-snackbar",
          {
            props: {
              value: this.showSnackbar,
              ...this.options,
            },
            scopedSlots: {
              action: (props) => {
                return h(
                  "v-btn",
                  {
                    props: {
                      color: contrastingColor,
                      text: true,
                    },
                    on: {
                      click: () => {
                        this.showSnackbar = false
                      },
                    },
                    attrs: {
                      ...props.attrs,
                      class: "mr-2",
                    },
                  },
                  ["CLOSE"]
                )
              },
            },
          },
          [this.message]
        )
      },
      data: () => ({
        showSnackbar: false,
        message: "",
        options: {},
      }),
      watch: {
        showSnackbar(value) {
          if (!value) {
            this.$el.remove()
            this.$destroy()
          }
        },
      },
    })

    Vue.prototype.$snack = function (message, options = {}) {
      const snackInstance = new SnackComponent({
        data: {
          options: {
            ...defaultOptions,
            ...options,
          },
          message,
          showSnackbar: true,
        },
      })
      snackInstance.$mount()
      const appElement = document.getElementById("app")

      if (appElement) {
        appElement.appendChild(snackInstance.$el)
      } else {
        throw new Error("Could not find app element.")
      }
    }
  },
}

export default SnackPlugin
