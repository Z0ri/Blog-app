export class Post{
    constructor(
        public id: string = '',
        public author: string = '',
        public title: string = '',
        public url: string = '',
        public description: string = '',
        public like: number = 0,
        public dislike: number = 0
    ) {}
}