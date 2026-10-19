cmake_minimum_required (VERSION 3.22)
project (BLPConverter)
file(GLOB_RECURSE sources *.cpp *.hpp *.c *.h)
add_executable (blpconverter main.cpp ${sources})
set_target_properties(blpconverter PROPERTIES CXX_STANDARD 17)
target_include_directories(blpconverter PUBLIC
	blp2png
	png2blp
	include/libimagequant
	include/libpng
	include/libtxc_dxtn
	include/pngpp
	include/zlib
	include/thread_pool
)

if(UNIX)
	# The bundled zlib includes unistd.h only when this feature is enabled.
	# Provide POSIX declarations (read, write, close, lseek) to modern compilers.
	target_compile_definitions(blpconverter PRIVATE Z_HAVE_UNISTD_H=1)
	set(THREADS_PREFER_PTHREAD_FLAG ON)
	find_package(Threads REQUIRED)
	target_link_libraries(blpconverter PRIVATE Threads::Threads)
endif()
