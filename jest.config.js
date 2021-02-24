module.exports = {
    roots: ['./tests'],
    preset: 'ts-jest',
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
    },
    setupFilesAfterEnv: ['./jest.setup.js'],
};
