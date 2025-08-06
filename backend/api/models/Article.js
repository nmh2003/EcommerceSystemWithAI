module.exports = {
  attributes: {
    title: { type: "string", required: true },
    content: { type: "string", required: true },
  },
  customToJSON: function () {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
    };
  },
};
