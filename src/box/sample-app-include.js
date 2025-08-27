module.exports = async function() {
    ginger(function($g) {
        if(!$g.utils)
            $g.utils = {};
        $g.utils.sayHello = () => "Hey, Buddy!";
    });
};
