class Flash {
    req;

    constructor(req) {
        this.req = req;

        if (!this.req.session.messages) {
            this.req.session.messages = [];
        }
    }

    add = (text, type) => {
        this.req.session.messages.push({
            text,
            type
        });
    }

    success = (text) => {
        this.add(text, 'success');
    }

    error = (text) => {
        this.add(text, 'error');
    }

    popAll = () => {
        const messages = this.req.session.messages;
        this.req.session.messages = [];

        return messages;
    }
}

module.exports = (req, res, next) => {
    req.flash = new Flash(req);

    next();
}