module.exports = async function () {
    await ginger(async ($g) => {
        $g.response.send({ message: "DYNAMIC ROUTE TEST: List of all users" });
    });
};
