export class Post{
    constructor(
        public id: string = '',
        public title: string = '',
        public img: string = '',
        public description: string = '',
        public like: number = 0,
        public dislike: number = 0
    ) {}
}