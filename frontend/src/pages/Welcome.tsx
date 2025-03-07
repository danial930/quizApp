import { NavLink } from "react-router";

export default function Welcome() {
  return (
    <div className="h-screen shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
      <div className="grid grid-rows-2 gap-4 lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
        <div className="flex justify-center items-center ">
          <h2 className="w-140 text-3xl font-semibold tracking-tight text-balance text-blue-700 dark:text-white sm:text-4xl">
            Welcome to our website. Explore new door for teaching. Start using
            our app today.
          </h2>
          <img
            width={500}
            height={500}
            className="inline"
            src="https://sphero.com/cdn/shop/articles/learning_gaps_800x.png?v=1637190992"
            alt=""
          />
        </div>
        <div className="flex justify-center items-center flex-col">
          <p className="w-140 mt-6 text-lg/8 text-pretty text-blue-600 dark:text-white">
            Ac euismod vel sit maecenas id pellentesque eu sed consectetur.
            Malesuada adipiscing sagittis vel nulla.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <NavLink
              to={"/login"}
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white dark:white shadow-xs hover:bg-blue-800 dark:hover:text-blue-700 dark:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Create Quiz
            </NavLink>
            <a href="#" className="text-sm/6 font-semibold text-blue-600">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
