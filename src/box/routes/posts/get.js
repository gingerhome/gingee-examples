module.exports = async function () {
    await ginger(async ($g) => {
        const { userId, postId } = $g.request.params;
        $g.response.send({ message: `DYNAMIC ROUTE TEST: Details for post ${postId} by user ${userId}` });
    });
};
