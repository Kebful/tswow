#include "CustomPacketBuffer.h"
#include "CustomPacketRead.h"
#include "CustomPacketWrite.h"
#undef NDEBUG
#include <cassert>
#include <cstring>
#include <vector>
struct Receiver : CustomPacketBuffer
{
    Receiver() : CustomPacketBuffer(8, 200000, 64) {}
    std::vector<char> expected;
    int calls = 0;
    void OnPacket(CustomPacketRead* p) override
    {
        auto q = p->ReadBytes(expected.size());
        assert(q);
        assert(!memcmp(q, expected.data(), expected.size()));
        delete[] q;
        ++calls;
    }
};
int main()
{
    // Cleanup must also handle an incomplete message and rejected next fragment.
    {
        CustomPacketWrite writer(42, 64, 0);
        std::vector<char> data(100, 'x');
        writer.WriteBytes(data.size(), data.data());
        auto& fragments = writer.buildMessages();
        Receiver receiver;
        assert(receiver.ReceivePacket(fragments[0].FullSize(), fragments[0].Data()) ==
               CustomPacketResult::HANDLED_FRAGMENT);
        std::vector<char> bad(fragments[1].Data(), fragments[1].Data() + fragments[1].FullSize());
        reinterpret_cast<CustomPacketHeader*>(bad.data())->fragmentId = 5;
        assert(receiver.ReceivePacket(bad.size(), bad.data()) == CustomPacketResult::INVALID_FRAG_ID);
        assert(receiver.Size() == 0);
        receiver.clearPacket();
        // Leaving the next message incomplete exercises the receiver destructor.
        assert(receiver.ReceivePacket(fragments[0].FullSize(), fragments[0].Data()) ==
               CustomPacketResult::HANDLED_FRAGMENT);
        writer.Destroy();
    }

    for (int n = 0; n < 100; n++)
    {
        CustomPacketWrite w(42, 64, 0);
        const size_t lengths[] = {1, 12, 57, 58, 59, 116, 400, 65536};
        std::vector<char> data(lengths[n % 8]);
        for (size_t i = 0; i < data.size(); i++)
            data[i] = char(i);
        w.WriteBytes(data.size(), data.data());
        CustomPacketRead copy(w);
        assert(copy.Size() == data.size());
        auto bytes = copy.ReadBytes(data.size());
        assert(!memcmp(bytes, data.data(), data.size()));
        delete[] bytes;
        // Rewind at fragment boundaries without losing the payload size.
        copy.Reset();
        assert(copy.Size() == data.size());
        bytes = copy.ReadBytes(data.size());
        assert(bytes && !memcmp(bytes, data.data(), data.size()));
        delete[] bytes;
        copy.Destroy();
        assert(copy.Size() == 0 && copy.ChunkCount() == 0);
        copy.Reset();
        assert(copy.ReadBytes(1) == nullptr);
        Receiver r;
        r.expected           = data;
        size_t payloadOffset = 0;
        for (auto& c : w.buildMessages())
        {
            assert(c.Header()->opcode == 42);
            assert(c.FullSize() <= 64);
            assert(!memcmp(c.Data() + CustomHeaderSize, data.data() + payloadOffset, c.Size()));
            payloadOffset += c.Size();
            std::vector<char> incoming(c.Data(), c.Data() + c.FullSize());
            auto result = r.ReceivePacket(incoming.size(), incoming.data());
            assert(result == CustomPacketResult::HANDLED_FRAGMENT || result == CustomPacketResult::HANDLED_MESSAGE);
        }
        assert(payloadOffset == data.size());
        assert(r.calls == 1);
        r.clearPacket();
        r.clearPacket();
        // Delayed dispatch must own the bytes after the caller releases its buffer.
        if (data.size() == 12)
        {
            auto& fragment = w.buildMessages()[0];
            {
                std::vector<char> incoming(fragment.Data(), fragment.Data() + fragment.FullSize());
                r.ReceivePacket(incoming.size(), incoming.data(), true);
            }
            r.callOnSuccess();
            assert(r.calls == 2);
        }
        w.Destroy();
        CustomPacketChunk a(16), b(32);
        a = b;
        assert(a.Data() != b.Data());
        a = a;
        CustomPacketChunk c(std::move(a));
        b = std::move(c);
        b = std::move(b);
        b.Destroy();
        b.Destroy();
        a.Destroy();
        c.Destroy();
    }
}
