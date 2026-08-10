
class ApiFeature {
  constructor(query) {
    this.query = { ...query };
    this.where = {};
    this.orderBy = {};
    this.take = 10;
    this.skip;

  }

  filter() {
    for (let [key, value] of Object.entries(this.query)) {
      if(key === "sort" || key === "page" || key === "search") continue
      if (
        key.includes("[gt]") ||
        key.includes("[gte]") ||
        key.includes("[lt]") ||
        key.includes("[lte]")
      ) {
        const [, feild, operator] = key.match(/(.+)\[(.+)\]/);

        if (this.where[feild] == null) this.where[feild] = {};

        this.where[feild][operator] = value;
      } else this.where[key] = value;
    }

    return this
  }

  sort() {
    for (let [key, value] of Object.entries(this.query)) {
      if (key.includes("sort")) {
        const sortType = value.includes("-") ? "desc" : "asc"
        value = value.startsWith("-") ? value.slice(1) : value
        this.orderBy[value] = sortType;
      }
    }

    return this
  }

  search() {
    for (let [key, value] of Object.entries(this.query)) {
      if (key === "search") {
          this.where.title = {
          contains: `${value}`,
          mode: "insensitive",
        } 
      }
    }

    return this
  }

  pagination() {
    const page = this.query.page || 1;
    this.skip = (page - 1) * this.take;

    return this
  }

  build() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      take: this.take,
      skip: this.skip
    };
  }
}

export default ApiFeature;
