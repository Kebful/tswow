import { wfs } from "../util/FileSystem";
import { ipaths } from "../util/Paths";
import { isWindows } from "../util/Platform";
import { wsys } from "../util/System";
import { SOURCE_ADT_URL } from "./BuildConfig";
import { bpaths, spaths } from "./CompilePaths";
import { DownloadFile } from "./Downloader";

export namespace ADTCreator {
    export async function create(cmake: string) {
        if(isWindows()) {
            wsys.exec(`${cmake} `
                + ` -S "${spaths.misc.adtcreator.get()}" `
                + ` -B "${bpaths.adtcreator.get()}"`, 'inherit');
            wsys.exec(`${cmake}`
                + ` --build "${bpaths.adtcreator.get()}"`
                + ` --config Release`, 'inherit');
            bpaths.adtcreator.Release.adt_creator_exe
                .copy(ipaths.bin.adtcreator.adtcreator_exe)
        } else {
            wsys.exec(`${cmake}`
                + ` -S "${spaths.misc.adtcreator.get()}"`
                + ` -B "${bpaths.adtcreator.get()}"`
                + ` -DCMAKE_BUILD_TYPE=Release`, 'inherit');
            wsys.exec(`${cmake} --build "${bpaths.adtcreator.get()}"`, 'inherit');
            wfs.copy(bpaths.adtcreator.join('adt-creator'), ipaths.bin.adtcreator.adtcreator_exe);
        }

        await DownloadFile(
              SOURCE_ADT_URL
            , bpaths.sourceAdt.get()
        )
        wfs.copy(bpaths.sourceAdt,ipaths.bin.sourceAdt);
    }
}
