module.exports = async function() {
    gingee(function($g) {
        try{
            $g.response.send($g.utils.sayHello());
        } catch (error) {
            $g.response.send(`Error: ${error.message}`, 500, 'text/plain');
        }
    });
};
