module.exports = async function () {
    await gingee(async ($g) => {
        $g.response.send({ message: "DYNAMIC ROUTE TEST: List of all users" });
    });
};
