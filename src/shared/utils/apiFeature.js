class ApiFeature {
  constructor(query) {
    this.query = { ...query };
    this.result = {};
  }

  filter() {
    const queryKeys = Object.keys(this.query);
    queryKeys.forEach((key) => {
      if (key.includes("[")) {
        const [, field, operator] = key.match(/(.+)\[(.+)\]/);
        this.query[field] = this.query[field] || {};
        this.query[field][`$${operator}`] = this.query[key];
        delete this.query[key];
      }
    });

    return this;
  }

  sort() {
    const queryKeys = Object.keys(this.query);
    queryKeys.forEach((key) => {
      if (key === "sort") {
        const [field, sortType] = this.query[key].includes(":")
          ? this.query[key].split(":")
          : [this.query[key], "desc"];
        this.query.orderBy = this.query.orderBy || {};
        this.query.orderBy[field] = sortType;
        delete this.query[key];
      }
    });

    return this;
  }

  search() {
    const queryKeys = Object.keys(this.query);
    queryKeys.forEach((key) => {
      if (key === "search") {
        this.query.title = {
          contains: `${this.query[key]}`,
          mode: "insensitive",
        };

        delete this.query[key];
      }
    });

    return this;
  }

  pagination() {
    const page = this.query.page || 1;
    this.query.take = 10;
    this.query.skip = (page - 1) * this.query.take;

    delete this.query.page;

    return this;
  }

  build() {
    let orderBy;
    if (this.query.orderBy) {
      orderBy = { ...this.query.orderBy };
      delete this.query.orderBy;
    }
    const { take, skip } = this.query;
    delete this.query.take;
    delete this.query.skip;

    return {
      where: this.query,
      orderBy,
      take,
      skip,
    };
  }
}

export default ApiFeature;
