export class Comment {
    constructor(
        public postId: string = '',
        public authorId: string = '',
        public username: string = '',
        public content: string = '',
        public likes: number = 0,
        public dislikes: number = 0
    ) {}
}