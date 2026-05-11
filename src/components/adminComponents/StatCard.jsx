export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  image,
  imageclassName = "",
  color = "text-yellow",
  valueClassName = "", // <--- Add this new prop
  subtextClassName = "", // <--- Add this new prop
}) {
  return (
    <div
      className={`bg-white p-1 sm:py-2 sm:px-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-evenly sm:justify-between `}
    >
      <div>
        <p className="text-[5px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </p>
        <h3
          className={`${valueClassName || "text-sm sm:text-xl lg:text-3xl"} font-serif font-bold text-gray-900 sm:mt-1`}
        >
          {value}
        </h3>
        <p
          className={`text-[11px] font-medium sm:mt-1 ${subtextClassName || "text-green-600"}`}
        >
          {subtext}
        </p>
      </div>
      {image ? (
        /* Image Div: No background, custom sizing */
        <div className="p-1 hidden lg:block ">
          <img
            src={image}
            alt={title}
            className={` object-contain ${imageclassName}`}
          />
        </div>
      ) : (
        /* Icon Div: Keeps the black background box */
        <div
          className={`p-2 lg:p-4 bg-dark rounded-lg flex items-center justify-center shrink-0 ml-4 ${color}`}
        >
          {Icon && <Icon size={15} lg:size={24} />}
        </div>
      )}
    </div>
  );
}
