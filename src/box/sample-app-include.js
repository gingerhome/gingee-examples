module.exports = async function() {
    gingee(function($g) {
        if(!$g.utils)
            $g.utils = {};
        $g.utils.sayHello = () => "Hey, Buddy!";
    });
};
