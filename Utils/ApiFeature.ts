import {Request,Response,NextFunction} from "express"

 export class ApiFeatures<T> {
    query: any;
    queryString: any;

    constructor(query: any, queryString: any) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(): ApiFeatures<T> {
        const queryObj: any = { ...this.queryString };
        const excludeFields: string[] = ['page', 'sort', 'limit', 'field'];
        excludeFields.forEach(el => delete queryObj[el]);

        let queryString: string = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    sort(): ApiFeatures<T> {
        if (this.queryString.sort) {
            const sortBy: string = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields(): ApiFeatures<T> {
        if (this.queryString.field) {
            const fields: string = this.queryString.field.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate(): ApiFeatures<T> {
        const page: number = Number(this.queryString.page) || 1;
        const limit: number = Number(this.queryString.limit) || 100;
        const skip: number = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

// Example usage:
// const features = new ApiFeatures<MyDocumentType>(query, queryString);
// features.filter().sort().limitFields().paginate();