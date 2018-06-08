export default {
    open(key) {
        this.setState({
            [key]: true,
        });
    },
    close(key) {
        this.setState({
            [key]: false,
        });
    },
};

