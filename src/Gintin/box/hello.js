module.exports = async function() {
   await gingee(async ($g) => {
        $g.response.send({ message: 'Hello from the gintin server script!' });
    });
};
